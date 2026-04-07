using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("SupportMessage")]
[Index("SupportTicketId", Name = "IX_SupportMessage_TicketId")]
public partial class SupportMessage
{
    [Key]
    public int SupportMessageId { get; set; }

    public int SupportTicketId { get; set; }

    public int FromUserId { get; set; }

    public string MessageBody { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime SentAt { get; set; }

    [ForeignKey("FromUserId")]
    [InverseProperty("SupportMessages")]
    public virtual User FromUser { get; set; } = null!;

    [ForeignKey("SupportTicketId")]
    [InverseProperty("SupportMessages")]
    public virtual SupportTicket SupportTicket { get; set; } = null!;

    [InverseProperty("SupportMessage")]
    public virtual ICollection<UserNotification> UserNotifications { get; set; } = new List<UserNotification>();
}
