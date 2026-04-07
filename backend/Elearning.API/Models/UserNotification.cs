using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("UserNotification")]
[Index("IsRead", Name = "IX_UserNotification_IsRead")]
[Index("UserId", Name = "IX_UserNotification_UserId")]
public partial class UserNotification
{
    [Key]
    public int UserNotificationId { get; set; }

    public int UserId { get; set; }

    public int? SupportTicketId { get; set; }

    public int? SupportMessageId { get; set; }

    [StringLength(200)]
    public string Title { get; set; } = null!;

    public string Body { get; set; } = null!;

    public bool IsActive { get; set; } 

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserNotifications")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("SupportTicketId")]
    [InverseProperty("UserNotifications")]
    public virtual SupportTicket? SupportTicket { get; set; }

    [ForeignKey("SupportMessageId")]
    [InverseProperty("UserNotifications")]
    public virtual SupportMessage? SupportMessage { get; set; }
}
