using ToDos.Interfaces;

namespace ToDos.Models;

public abstract class BaseEntity : ITimestamped, ISoftDeletable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime? DeletedAt { get; set; } = null;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
