using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("LessonContentBlock")]
[Index("LessonId", Name = "IX_LessonContentBlock_LessonId")]
public partial class LessonContentBlock
{
    [Key]
    public int LessonContentBlockId { get; set; }

    public int LessonId { get; set; }

    [StringLength(50)]
    public string BlockType { get; set; } = null!;

    public string? Content { get; set; }

    public bool IsActive { get; set; }

    public int OrderIndex { get; set; }

    [ForeignKey("LessonId")]
    [InverseProperty("LessonContentBlocks")]
    public virtual Lesson Lesson { get; set; } = null!;
}
