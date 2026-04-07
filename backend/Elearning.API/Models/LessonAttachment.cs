using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("LessonAttachment")]
[Index("LessonId", Name = "IX_LessonAttachment_LessonId")]
public partial class LessonAttachment
{
    [Key]
    public int LessonAttachmentId { get; set; }

    public int LessonId { get; set; }

    [StringLength(255)]
    public string FileName { get; set; } = null!;

    [StringLength(500)]
    public string FileUrl { get; set; } = null!;

    public bool IsActive { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [ForeignKey("LessonId")]
    [InverseProperty("LessonAttachments")]
    public virtual Lesson Lesson { get; set; } = null!;
}
