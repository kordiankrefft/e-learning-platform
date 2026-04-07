using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("AuditLog")]
[Index("EntityId", Name = "IX_AuditLog_EntityId")]
[Index("EntityName", Name = "IX_AuditLog_EntityName")]
[Index("UserId", Name = "IX_AuditLog_UserId")]
public partial class AuditLog
{
    [Key]
    public int AuditLogId { get; set; }

    public int? UserId { get; set; }

    [StringLength(100)]
    public string ActionType { get; set; } = null!;

    [StringLength(100)]
    public string EntityName { get; set; } = null!;

    [StringLength(100)]
    public string EntityId { get; set; } = null!;

    public string? Details { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsActive { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("AuditLogs")]
    public virtual User? User { get; set; }
}
