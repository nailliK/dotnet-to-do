using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ToDos.Models;

namespace ToDos.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> entity)
    {
        entity.HasQueryFilter(u => !u.IsDeleted);

        entity.HasMany(u => u.ToDos)
          .WithOne(t => t.CreatedBy)
          .HasForeignKey(t => t.CreatedById)
          .OnDelete(DeleteBehavior.ClientCascade);
    }
}
