using ToDos.Enums;

namespace ToDos.Models;

public class ToDo : BaseEntity
{
    public int SortOrder { get; set; } = 0;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ToDoStatus Status { get; set; } = ToDoStatus.Pending;
    public DateTime? CompletedAt { get; set; } = null;

    public Guid CreatedById { get; set; }
    public required User CreatedBy { get; set; }

    public Guid? ParentId { get; set; }
    public ToDo? Parent { get; set; }
    public ICollection<ToDo> Children { get; set; } = new List<ToDo>();

    public Guid? BlockedById { get; set; }
    public ToDo? BlockedBy { get; set; }
    public ICollection<ToDo> Blocking { get; set; } = new List<ToDo>();
}