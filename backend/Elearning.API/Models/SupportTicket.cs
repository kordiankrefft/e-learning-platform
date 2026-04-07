using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("SupportTicket")]
[Index("Status", Name = "IX_SupportTicket_Status")]
[Index("UserId", Name = "IX_SupportTicket_UserId")]
public partial class SupportTicket
{
    [Key]
    public int SupportTicketId { get; set; }

    public int UserId { get; set; }

    public int? CourseId { get; set; }

    public int? AssignedTutorId { get; set; }

    [StringLength(200)]
    public string Title { get; set; } = null!;

    [StringLength(50)]
    public string Status { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ClosedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("SupportTickets")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("CourseId")]
    [InverseProperty("SupportTickets")]
    public virtual Course? Course { get; set; }

    [ForeignKey("AssignedTutorId")]
    [InverseProperty("AssignedTickets")]
    public virtual User? AssignedTutor { get; set; }

    [InverseProperty("SupportTicket")]
    public virtual ICollection<SupportMessage> SupportMessages { get; set; } = new List<SupportMessage>();

    [InverseProperty("SupportTicket")]
    public virtual ICollection<UserNotification> UserNotifications { get; set; } = new List<UserNotification>();
}
