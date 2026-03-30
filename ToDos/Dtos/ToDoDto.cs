using System.ComponentModel.DataAnnotations;
using ToDos.Enums;

namespace ToDos.Dtos;

public class CreateToDoRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public required string Title { get; set; }

    [StringLength(2000)]
    public string? Description { get; set; }

    public Guid? ParentId { get; set; }
    public int? SortOrder { get; set; }
}

public class UpdateToDoRequest
{
    [StringLength(200, MinimumLength = 1)]
    public string? Title { get; set; }

    [StringLength(2000)]
    public string? Description { get; set; }

    public ToDoStatus? Status { get; set; }
    public int? SortOrder { get; set; }
    public Guid? ParentId { get; set; }
    public Guid? BlockedById { get; set; }
}

public class ToDoResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ToDoStatus Status { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid? ParentId { get; set; }
    public Guid? BlockedById { get; set; }
}
