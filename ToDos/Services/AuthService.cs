using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ToDos.Common;
using ToDos.Data;
using ToDos.Dtos;
using ToDos.Models;

namespace ToDos.Services;

public interface IAuthService
{
    Task<ServiceResult<AuthResponse>> Register(AuthRequest request);
    Task<ServiceResult<AuthResponse>> Login(AuthRequest request);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;
    private readonly PasswordHasher<User> _hasher = new();

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<ServiceResult<AuthResponse>> Register(AuthRequest request)
    {
        var userName = request.UserName.ToLower();

        if (await _db.Users.AnyAsync(u => u.UserName == userName))
            return ServiceResult<AuthResponse>.Fail(409, "Username already exists");

        var user = new User { UserName = userName };
        user.PasswordHash = _hasher.HashPassword(user, request.Password);

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return ServiceResult<AuthResponse>.Ok(
            new AuthResponse(GenerateToken(user), user.Id, user.UserName));
    }

    public async Task<ServiceResult<AuthResponse>> Login(AuthRequest request)
    {
        var username = request.UserName.ToLower();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserName == username);
        if (user is null)
            return ServiceResult<AuthResponse>.Fail(401, "Invalid credentials");

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result != PasswordVerificationResult.Success)
            return ServiceResult<AuthResponse>.Fail(401, "Invalid credentials");

        return ServiceResult<AuthResponse>.Ok(
            new AuthResponse(GenerateToken(user), user.Id, user.UserName));
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName)
        };

        var token = new JwtSecurityToken(
            _config["Jwt:Issuer"],
            _config["Jwt:Audience"],
            claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}