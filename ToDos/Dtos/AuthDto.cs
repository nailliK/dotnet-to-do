namespace ToDos.Dtos;

public class AuthRequest
{
    public required string UserName { get; set; }
    public required string Password { get; set; }
}

public record AuthResponse(string Token, Guid UserId, string UserName);