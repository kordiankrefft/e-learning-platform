using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("Announcement")]
[Index("IsPublished", Name = "IX_Announcement_IsPublished")]
public partial class Announcement
{
    [Key]
    public int AnnouncementId { get; set; }

    [StringLength(200)]
    public string Title { get; set; } = null!;

    public string Body { get; set; } = null!;

    public bool IsPublished { get; set; }

    public DateTime? PublishAt { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public int CreatedByUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; }

    [ForeignKey("CreatedByUserId")]
    [InverseProperty("Announcements")]
    public virtual User CreatedByUser { get; set; } = null!;
}
