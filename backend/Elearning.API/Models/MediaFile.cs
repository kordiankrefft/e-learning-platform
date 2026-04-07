using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("MediaFile")]
[Index("UploadedByUserId", Name = "IX_MediaFile_UserId")]
public partial class MediaFile
{
    [Key]
    public int MediaFileId { get; set; }

    [StringLength(500)]
    public string FileUrl { get; set; } = null!;

    [StringLength(255)]
    public string FileName { get; set; } = null!;

    [StringLength(100)]
    public string? MimeType { get; set; }

    public int? Width { get; set; }

    public int? Height { get; set; }

    public bool IsActive { get; set; }

    public DateTime UploadedAt { get; set; }

    public int? UploadedByUserId { get; set; }

    [InverseProperty("ThumbnailMedia")]
    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    [InverseProperty("MediaFile")]
    public virtual ICollection<PageContentBlock> PageContentBlocks { get; set; } = new List<PageContentBlock>();

    [ForeignKey("UploadedByUserId")]
    [InverseProperty("MediaFiles")]
    public virtual User? UploadedByUser { get; set; }
}
