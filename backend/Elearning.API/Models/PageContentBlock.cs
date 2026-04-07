using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("PageContentBlock")]
[Index("IsActive", Name = "IX_PageContentBlock_IsActive")]
[Index("PageKey", Name = "IX_PageContentBlock_PageKey")]
public partial class PageContentBlock
{
    [Key]
    public int PageContentBlockId { get; set; }

    [StringLength(100)]
    public string PageKey { get; set; } = null!;

    [StringLength(50)]
    public string BlockType { get; set; } = null!;

    public string? Content { get; set; }

    public int? MediaFileId { get; set; }

    public int OrderIndex { get; set; }

    public bool IsActive { get; set; }

    public int? UpdatedByUserId { get; set; }

    public DateTime UpdatedAt { get; set; }

    [ForeignKey("MediaFileId")]
    [InverseProperty("PageContentBlocks")]
    public virtual MediaFile? MediaFile { get; set; }

    [ForeignKey("UpdatedByUserId")]
    [InverseProperty("PageContentBlocks")]
    public virtual User? UpdatedByUser { get; set; }
}
