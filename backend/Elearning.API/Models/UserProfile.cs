using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("UserProfile")]
[Index("UserId", Name = "UQ__UserProf__1788CC4D152BB571", IsUnique = true)]
public partial class UserProfile
{
    [Key]
    public int UserProfileId { get; set; }

    public int UserId { get; set; }

    [StringLength(200)]
    public string? DisplayName { get; set; }

    public bool IsActive { get; set; }

    [StringLength(50)]
    public string? PreferredLanguage { get; set; }

    [StringLength(1000)]
    public string? Bio { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserProfile")]
    public virtual User User { get; set; } = null!;
}
