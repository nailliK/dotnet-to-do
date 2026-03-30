using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ToDos.Dtos;
using ToDos.Services;

namespace ToDos.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ToDosController : ControllerBase
{
    private readonly IToDoService _toDoService;

    public ToDosController(IToDoService toDoService)
    {
        _toDoService = toDoService;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ToDoResponse>>> GetAll()
    {
        var result = await _toDoService.GetAll(GetUserId());
        return Ok(result.Data);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ToDoResponse>> GetById(Guid id)
    {
        var result = await _toDoService.GetById(id, GetUserId());
        if (!result.Success) return StatusCode(result.StatusCode, result.Error);
        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<ActionResult<ToDoResponse>> Create(CreateToDoRequest request)
    {
        var result = await _toDoService.Create(request, GetUserId());
        if (!result.Success) return StatusCode(result.StatusCode, result.Error);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateToDoRequest request)
    {
        var result = await _toDoService.Update(id, request, GetUserId());
        if (!result.Success) return StatusCode(result.StatusCode, result.Error);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await _toDoService.Delete(id, GetUserId());
        if (!result.Success) return StatusCode(result.StatusCode, result.Error);
        return NoContent();
    }
}
