using System.ComponentModel.DataAnnotations;

namespace ToDos.Dtos;

public class AuthRequest
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Username can only contain letters, numbers, and underscores")]
    public required string UserName { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public required string Password { get; set; }
}

public record AuthResponse(string Token, Guid UserId, string UserName);
