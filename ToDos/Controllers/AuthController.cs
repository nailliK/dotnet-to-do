using Microsoft.AspNetCore.Mvc;
using ToDos.Dtos;
using ToDos.Services;

namespace ToDos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(AuthRequest request)
    {
        var result = await _auth.Register(request);
        if (!result.Success) return StatusCode(result.StatusCode, result.Error);
        return Ok(result.Data);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(AuthRequest request)
    {
        var result = await _auth.Login(request);
        if (!result.Success) return StatusCode(result.StatusCode, result.Error);
        return Ok(result.Data);
    }
}