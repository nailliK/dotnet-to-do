using Microsoft.Extensions.Configuration;
using ToDos.Dtos;
using ToDos.Services;
using ToDos.Tests.Helpers;

namespace ToDos.Tests.Unit;

public class AuthServiceTests
{
    private static IConfiguration CreateConfig()
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "TestKeyThatIsAtLeast32CharactersLong!",
                ["Jwt:Issuer"] = "TestIssuer",
                ["Jwt:Audience"] = "TestAudience"
            })
            .Build();
    }

    private static AuthService CreateService()
    {
        var db = TestDbContext.Create();
        return new AuthService(db, CreateConfig());
    }

    [Fact]
    public async Task Register_CreatesUser_ReturnsToken()
    {
        var service = CreateService();
        var request = new AuthRequest { UserName = "newuser", Password = "password123" };

        var result = await service.Register(request);

        Assert.True(result.Success);
        Assert.NotEmpty(result.Data!.Token);
        Assert.Equal("newuser", result.Data.UserName);
    }

    [Fact]
    public async Task Register_DuplicateUsername_Fails()
    {
        var service = CreateService();
        var request = new AuthRequest { UserName = "duplicate", Password = "password123" };

        await service.Register(request);
        var result = await service.Register(request);

        Assert.False(result.Success);
        Assert.Equal(409, result.StatusCode);
    }

    [Fact]
    public async Task Register_NormalizesUsername()
    {
        var service = CreateService();

        await service.Register(new AuthRequest { UserName = "TestUser", Password = "password123" });
        var result = await service.Register(new AuthRequest { UserName = "testuser", Password = "password123" });

        Assert.False(result.Success);
        Assert.Equal(409, result.StatusCode);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        var service = CreateService();
        await service.Register(new AuthRequest { UserName = "loginuser", Password = "password123" });

        var result = await service.Login(new AuthRequest { UserName = "loginuser", Password = "password123" });

        Assert.True(result.Success);
        Assert.NotEmpty(result.Data!.Token);
    }

    [Fact]
    public async Task Login_WrongPassword_Fails()
    {
        var service = CreateService();
        await service.Register(new AuthRequest { UserName = "user", Password = "correct" });

        var result = await service.Login(new AuthRequest { UserName = "user", Password = "wrong" });

        Assert.False(result.Success);
        Assert.Equal(401, result.StatusCode);
    }

    [Fact]
    public async Task Login_NonExistentUser_Fails()
    {
        var service = CreateService();

        var result = await service.Login(new AuthRequest { UserName = "ghost", Password = "password" });

        Assert.False(result.Success);
        Assert.Equal(401, result.StatusCode);
    }
}
