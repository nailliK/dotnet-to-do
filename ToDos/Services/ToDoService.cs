using Microsoft.EntityFrameworkCore;
using ToDos.Common;
using ToDos.Data;
using ToDos.Dtos;
using ToDos.Models;

namespace ToDos.Services;

public interface IToDoService
{
    Task<ServiceResult<IEnumerable<ToDoResponse>>> GetAll(Guid userId);
    Task<ServiceResult<ToDoResponse>> GetById(Guid id, Guid userId);
    Task<ServiceResult<ToDoResponse>> Create(CreateToDoRequest request, Guid userId);
    Task<ServiceResult<bool>> Update(Guid id, UpdateToDoRequest request, Guid userId);
    Task<ServiceResult<bool>> Delete(Guid id, Guid userId);
}

public class ToDoService : IToDoService
{
    private readonly AppDbContext _db;

    public ToDoService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResult<IEnumerable<ToDoResponse>>> GetAll(Guid userId)
    {
        var items = await _db.ToDos
          .Where(t => t.CreatedById == userId)
          .OrderBy(t => t.SortOrder)
          .Select(t => MapToResponse(t))
          .ToListAsync();

        return ServiceResult<IEnumerable<ToDoResponse>>.Ok(items);
    }

    public async Task<ServiceResult<ToDoResponse>> GetById(Guid id, Guid userId)
    {
        var item = await _db.ToDos
          .FirstOrDefaultAsync(t => t.Id == id && t.CreatedById == userId);

        if (item is null)
            return ServiceResult<ToDoResponse>.Fail(404, "To-do not found");

        return ServiceResult<ToDoResponse>.Ok(MapToResponse(item));
    }

    public async Task<ServiceResult<ToDoResponse>> Create(CreateToDoRequest request, Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null)
            return ServiceResult<ToDoResponse>.Fail(401, "User not found");

        var item = new ToDo
        {
            Title = request.Title,
            Description = request.Description,
            ParentId = request.ParentId,
            SortOrder = request.SortOrder ?? 0,
            CreatedById = userId,
            CreatedBy = user
        };

        _db.ToDos.Add(item);
        await _db.SaveChangesAsync();

        return ServiceResult<ToDoResponse>.Ok(MapToResponse(item));
    }

    public async Task<ServiceResult<bool>> Update(Guid id, UpdateToDoRequest request, Guid userId)
    {
        var item = await _db.ToDos
          .FirstOrDefaultAsync(t => t.Id == id && t.CreatedById == userId);

        if (item is null)
            return ServiceResult<bool>.Fail(404, "To-do not found");

        if (request.Title is not null) item.Title = request.Title;
        if (request.Description is not null) item.Description = request.Description;
        if (request.Status.HasValue) item.Status = request.Status.Value;
        if (request.SortOrder.HasValue) item.SortOrder = request.SortOrder.Value;
        if (request.ParentId.HasValue) item.ParentId = request.ParentId.Value;
        if (request.BlockedById.HasValue) item.BlockedById = request.BlockedById.Value;

        await _db.SaveChangesAsync();
        return ServiceResult<bool>.Ok(true);
    }

    public async Task<ServiceResult<bool>> Delete(Guid id, Guid userId)
    {
        var item = await _db.ToDos
          .FirstOrDefaultAsync(t => t.Id == id && t.CreatedById == userId);

        if (item is null)
            return ServiceResult<bool>.Fail(404, "To-do not found");

        await LoadAllChildren(item);
        _db.ToDos.Remove(item);
        await _db.SaveChangesAsync();

        return ServiceResult<bool>.Ok(true);
    }

    // This produces n+1 but we're only using it for deletes
    private async Task LoadAllChildren(ToDo item)
    {
        await _db.Entry(item).Collection(t => t.Children).LoadAsync();
        foreach (var child in item.Children)
            await LoadAllChildren(child);
    }

    private static ToDoResponse MapToResponse(ToDo t)
    {
        return new ToDoResponse
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            SortOrder = t.SortOrder,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt,
            CompletedAt = t.CompletedAt,
            ParentId = t.ParentId,
            BlockedById = t.BlockedById
        };
    }
}
