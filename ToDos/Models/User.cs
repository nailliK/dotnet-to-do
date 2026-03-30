namespace ToDos.Models;

public class User : BaseEntity
{
    public string UserName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    public ICollection<ToDo> ToDos { get; set; } = new List<ToDo>();
}
