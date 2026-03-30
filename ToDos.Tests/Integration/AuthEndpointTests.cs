using System.Net;
using System.Net.Http.Json;
using ToDos.Dtos;
using ToDos.Tests.Helpers;

namespace ToDos.Tests.Integration;

public class AuthEndpointTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public AuthEndpointTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_ReturnsToken()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register",
          new AuthRequest { UserName = "integrationuser" + Guid.NewGuid(), Password = "password123" });

        response.EnsureSuccessStatusCode();
        var data = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(data);
        Assert.NotEmpty(data.Token);
    }

    [Fact]
    public async Task Register_DuplicateUsername_Returns409()
    {
        var client = _factory.CreateClient();
        var username = "dupeuser" + Guid.NewGuid();

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
        var username = "logintest" + Guid.NewGuid();

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
        var username = "wrongpw" + Guid.NewGuid();

        await client.PostAsJsonAsync("/api/auth/register",
          new AuthRequest { UserName = username, Password = "correct" });

        var response = await client.PostAsJsonAsync("/api/auth/login",
          new AuthRequest { UserName = username, Password = "wrong" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_NonExistentUser_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
          new AuthRequest { UserName = "nobody" + Guid.NewGuid(), Password = "password" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
