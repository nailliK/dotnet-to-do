using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ToDos.Models;

namespace ToDos.Data.Configurations;

public class ToDoConfiguration : IEntityTypeConfiguration<ToDo>
{
    public void Configure(EntityTypeBuilder<ToDo> entity)
    {
        entity.HasQueryFilter(t => !t.IsDeleted);

        entity.Property(t => t.Status)
          .HasConversion<string>();

        entity.HasOne(t => t.Parent)
          .WithMany(t => t.Children)
          .HasForeignKey(t => t.ParentId)
          .OnDelete(DeleteBehavior.ClientCascade);

        entity.HasOne(t => t.BlockedBy)
          .WithMany(t => t.Blocking)
          .HasForeignKey(t => t.BlockedById)
          .OnDelete(DeleteBehavior.SetNull);
    }
}
