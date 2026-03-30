using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ToDos.Data;
using ToDos.Data.Interceptors;

namespace ToDos.Tests.Helpers;

public class TestApiFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = "TestDb_" + Guid.NewGuid();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration(config =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "TestKeyThatIsDefinitelyAtLeast32Characters!",
                ["Jwt:Issuer"] = "ToDos",
                ["Jwt:Audience"] = "ToDos"
            });
        });

        builder.ConfigureServices(services =>
        {
            // Remove all EF-related registrations
            var descriptorsToRemove = services
          .Where(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>)
                      || d.ServiceType == typeof(AppDbContext)
                      || d.ServiceType.FullName?.Contains("EntityFrameworkCore") == true)
          .ToList();

            foreach (var descriptor in descriptorsToRemove)
                services.Remove(descriptor);

            // Replace with in-memory database — same DB name for the lifetime of the factory
            services.AddDbContext<AppDbContext>(options =>
          options.UseInMemoryDatabase(_dbName)
            .AddInterceptors(new SoftDeleteInterceptor()));
        });

        builder.UseEnvironment("Development");
    }
}
