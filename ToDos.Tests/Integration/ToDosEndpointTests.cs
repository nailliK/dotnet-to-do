using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using ToDos.Dtos;
using ToDos.Enums;
using ToDos.Tests.Helpers;

namespace ToDos.Tests.Integration;

public class ToDosEndpointTests : IClassFixture<TestApiFactory>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly TestApiFactory _factory;

    public ToDosEndpointTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<(HttpClient client, string token)> CreateAuthenticatedClient()
    {
        var client = _factory.CreateClient();
        var username = "testuser" + Guid.NewGuid();

        var response = await client.PostAsJsonAsync("/api/auth/register",
          new AuthRequest { UserName = username, Password = "password123" });

        var data = await response.Content.ReadFromJsonAsync<AuthResponse>();
        client.DefaultRequestHeaders.Authorization =
          new AuthenticationHeaderValue("Bearer", data!.Token);

        return (client, data.Token);
    }

    [Fact]
    public async Task GetAll_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/todos");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Create_ReturnsCreatedToDo()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var response = await client.PostAsJsonAsync("/api/todos",
          new CreateToDoRequest { Title = "Integration test task" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var data = await response.Content.ReadFromJsonAsync<ToDoResponse>(JsonOptions);
        Assert.NotNull(data);
        Assert.Equal("Integration test task", data.Title);
        Assert.Equal(ToDoStatus.Pending, data.Status);
    }

    [Fact]
    public async Task GetAll_ReturnsCreatedToDos()
    {
        var (client, _) = await CreateAuthenticatedClient();

        await client.PostAsJsonAsync("/api/todos",
          new CreateToDoRequest { Title = "Task 1" });
        await client.PostAsJsonAsync("/api/todos",
          new CreateToDoRequest { Title = "Task 2" });

        var response = await client.GetAsync("/api/todos");
        response.EnsureSuccessStatusCode();

        var data = await response.Content.ReadFromJsonAsync<List<ToDoResponse>>(JsonOptions);
        Assert.NotNull(data);
        Assert.Equal(2, data.Count);
    }

    [Fact]
    public async Task GetById_ReturnsCorrectToDo()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var createResponse = await client.PostAsJsonAsync("/api/todos",
          new CreateToDoRequest { Title = "Find me" });
        var created = await createResponse.Content.ReadFromJsonAsync<ToDoResponse>(JsonOptions);

        var response = await client.GetAsync($"/api/todos/{created!.Id}");
        response.EnsureSuccessStatusCode();

        var data = await response.Content.ReadFromJsonAsync<ToDoResponse>(JsonOptions);
        Assert.Equal("Find me", data!.Title);
    }

    [Fact]
    public async Task GetById_WrongUser_Returns404()
    {
        var (client1, _) = await CreateAuthenticatedClient();

        var createResponse = await client1.PostAsJsonAsync("/api/todos",
          new CreateToDoRequest { Title = "Private task" });
        var created = await createResponse.Content.ReadFromJsonAsync<ToDoResponse>(JsonOptions);

        // Different user
        var (client2, _) = await CreateAuthenticatedClient();

        var response = await client2.GetAsync($"/api/todos/{created!.Id}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_ChangesFields()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var createResponse = await client.PostAsJsonAsync("/api/todos",
          new CreateToDoRequest { Title = "Original" });
        var created = await createResponse.Content.ReadFromJsonAsync<ToDoResponse>(JsonOptions);

        var updateResponse = await client.PutAsJsonAsync($"/api/todos/{created!.Id}",
          new UpdateToDoRequest { Title = "Updated", Status = ToDoStatus.InProgress });

        Assert.Equal(HttpStatusCode.NoContent, updateResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/todos/{created.Id}");
        var data = await getResponse.Content.ReadFromJsonAsync<ToDoResponse>(JsonOptions);
        Assert.Equal("Updated", data!.Title);
        Assert.Equal(ToDoStatus.InProgress, data.Status);
    }

    [Fact]
    public async Task Delete_RemovesToDo()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var createResponse = await client.PostAsJsonAsync("/api/todos",
          new CreateToDoRequest { Title = "Delete me" });
        var created = await createResponse.Content.ReadFromJsonAsync<ToDoResponse>(JsonOptions);

        var deleteResponse = await client.DeleteAsync($"/api/todos/{created!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/todos/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task Delete_NonExistent_Returns404()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var response = await client.DeleteAsync($"/api/todos/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task StatusEnum_SerializesAsString()
    {
        var (client, _) = await CreateAuthenticatedClient();

        var createResponse = await client.PostAsJsonAsync("/api/todos",
          new CreateToDoRequest { Title = "Enum test" });

        var json = await createResponse.Content.ReadAsStringAsync();
        Assert.Contains("\"Pending\"", json);
        Assert.DoesNotContain("\"status\":0", json);
    }
}
