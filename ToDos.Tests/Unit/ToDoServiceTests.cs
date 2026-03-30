using ToDos.Data;
using ToDos.Dtos;
using ToDos.Enums;
using ToDos.Models;
using ToDos.Services;
using ToDos.Tests.Helpers;

namespace ToDos.Tests.Unit;

public class ToDoServiceTests
{
    private readonly User _testUser;
    private readonly Guid _userId;

    public ToDoServiceTests()
    {
        _userId = Guid.NewGuid();
        _testUser = new User { Id = _userId, UserName = "testuser", PasswordHash = "hash" };
    }

    private (ToDoService service, AppDbContext db) CreateService()
    {
        var db = TestDbContext.Create();
        db.Users.Add(_testUser);
        db.SaveChanges();
        return (new ToDoService(db), db);
    }

    [Fact]
    public async Task Create_ReturnsNewToDo()
    {
        var (service, _) = CreateService();
        var request = new CreateToDoRequest { Title = "Test task" };

        var result = await service.Create(request, _userId);

        Assert.True(result.Success);
        Assert.Equal("Test task", result.Data!.Title);
        Assert.Equal(ToDoStatus.Pending, result.Data.Status);
    }

    [Fact]
    public async Task Create_WithInvalidUser_Fails()
    {
        var (service, _) = CreateService();
        var request = new CreateToDoRequest { Title = "Test task" };

        var result = await service.Create(request, Guid.NewGuid());

        Assert.False(result.Success);
        Assert.Equal(401, result.StatusCode);
    }

    [Fact]
    public async Task GetAll_ReturnsOnlyUsersToDos()
    {
        var (service, db) = CreateService();
        var otherUser = new User { Id = Guid.NewGuid(), UserName = "other", PasswordHash = "hash" };
        db.Users.Add(otherUser);

        db.ToDos.Add(new ToDo { Title = "My task", CreatedById = _userId, CreatedBy = _testUser });
        db.ToDos.Add(new ToDo { Title = "Other task", CreatedById = otherUser.Id, CreatedBy = otherUser });
        await db.SaveChangesAsync();

        var result = await service.GetAll(_userId);

        Assert.True(result.Success);
        Assert.Single(result.Data!);
        Assert.Equal("My task", result.Data!.First().Title);
    }

    [Fact]
    public async Task GetById_WrongUser_ReturnsNotFound()
    {
        var (service, db) = CreateService();
        var todo = new ToDo { Title = "Task", CreatedById = _userId, CreatedBy = _testUser };
        db.ToDos.Add(todo);
        await db.SaveChangesAsync();

        var result = await service.GetById(todo.Id, Guid.NewGuid());

        Assert.False(result.Success);
        Assert.Equal(404, result.StatusCode);
    }

    [Fact]
    public async Task Update_ChangesFields()
    {
        var (service, db) = CreateService();
        var todo = new ToDo { Title = "Original", CreatedById = _userId, CreatedBy = _testUser };
        db.ToDos.Add(todo);
        await db.SaveChangesAsync();

        var request = new UpdateToDoRequest { Title = "Updated", Status = ToDoStatus.InProgress };
        var result = await service.Update(todo.Id, request, _userId);

        Assert.True(result.Success);

        var updated = await service.GetById(todo.Id, _userId);
        Assert.Equal("Updated", updated.Data!.Title);
        Assert.Equal(ToDoStatus.InProgress, updated.Data.Status);
    }

    [Fact]
    public async Task Update_WrongUser_ReturnsNotFound()
    {
        var (service, db) = CreateService();
        var todo = new ToDo { Title = "Task", CreatedById = _userId, CreatedBy = _testUser };
        db.ToDos.Add(todo);
        await db.SaveChangesAsync();

        var request = new UpdateToDoRequest { Title = "Hacked" };
        var result = await service.Update(todo.Id, request, Guid.NewGuid());

        Assert.False(result.Success);
        Assert.Equal(404, result.StatusCode);
    }

    [Fact]
    public async Task Delete_SoftDeletes()
    {
        var (service, db) = CreateService();
        var todo = new ToDo { Title = "Task", CreatedById = _userId, CreatedBy = _testUser };
        db.ToDos.Add(todo);
        await db.SaveChangesAsync();

        var result = await service.Delete(todo.Id, _userId);
        Assert.True(result.Success);

        // Should not be found via normal query (query filter excludes soft-deleted)
        var getResult = await service.GetById(todo.Id, _userId);
        Assert.False(getResult.Success);
        Assert.Equal(404, getResult.StatusCode);
    }

    [Fact]
    public async Task Delete_CascadesToChildren()
    {
        var (service, db) = CreateService();
        var parent = new ToDo { Title = "Parent", CreatedById = _userId, CreatedBy = _testUser };
        var child = new ToDo { Title = "Child", CreatedById = _userId, CreatedBy = _testUser, Parent = parent };
        db.ToDos.AddRange(parent, child);
        await db.SaveChangesAsync();

        await service.Delete(parent.Id, _userId);

        // Both parent and child should be gone from normal queries
        var allResult = await service.GetAll(_userId);
        Assert.Empty(allResult.Data!);
    }

    [Fact]
    public async Task Delete_NonExistent_ReturnsNotFound()
    {
        var (service, _) = CreateService();

        var result = await service.Delete(Guid.NewGuid(), _userId);

        Assert.False(result.Success);
        Assert.Equal(404, result.StatusCode);
    }

    [Fact]
    public async Task Create_WithParent_SetsParentId()
    {
        var (service, db) = CreateService();
        var parent = new ToDo { Title = "Parent", CreatedById = _userId, CreatedBy = _testUser };
        db.ToDos.Add(parent);
        await db.SaveChangesAsync();

        var request = new CreateToDoRequest { Title = "Child", ParentId = parent.Id };
        var result = await service.Create(request, _userId);

        Assert.True(result.Success);
        Assert.Equal(parent.Id, result.Data!.ParentId);
    }
}
