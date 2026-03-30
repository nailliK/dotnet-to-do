using System.Net;
using System.Net.Http.Json;
using ToDos.Dtos;
using ToDos.Tests.Helpers;

namespace ToDos.Tests.Integration;

public class AuthEndpointTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;
    private static int _counter;

    public AuthEndpointTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    private static string UniqueUsername() => $"user_{Interlocked.Increment(ref _counter)}";

    [Fact]
    public async Task Register_ReturnsToken()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register",
            new AuthRequest { UserName = UniqueUsername(), Password = "password123" });

        response.EnsureSuccessStatusCode();
        var data = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(data);
        Assert.NotEmpty(data.Token);
    }

    [Fact]
    public async Task Register_DuplicateUsername_Returns409()
    {
        var client = _factory.CreateClient();
        var username = UniqueUsername();

        await client.PostAsJsonAsync("/api/auth/register",
            new AuthRequest { UserName = username, Password = "password123" });

        var response = await client.PostAsJsonAsync("/api/auth/register",
            new AuthRequest { UserName = username, Password = "password123" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        var client = _factory.CreateClient();
        var username = UniqueUsername();

        await client.PostAsJsonAsync("/api/auth/register",
            new AuthRequest { UserName = username, Password = "password123" });

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new AuthRequest { UserName = username, Password = "password123" });

        response.EnsureSuccessStatusCode();
        var data = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(data);
        Assert.NotEmpty(data.Token);
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        var client = _factory.CreateClient();
        var username = UniqueUsername();

        await client.PostAsJsonAsync("/api/auth/register",
            new AuthRequest { UserName = username, Password = "correctpass1" });

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new AuthRequest { UserName = username, Password = "wrongpass1" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_NonExistentUser_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new AuthRequest { UserName = UniqueUsername(), Password = "password123" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
