using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("IssuedCertificate")]
[Index("CourseId", Name = "IX_IssuedCertificate_CourseId")]
[Index("UserId", Name = "IX_IssuedCertificate_UserId")]
[Index("CertificateNumber", Name = "UQ__IssuedCe__E384CE0F496D1CB5", IsUnique = true)]
public partial class IssuedCertificate
{
    [Key]
    public int IssuedCertificateId { get; set; }

    public int UserId { get; set; }

    public int CourseId { get; set; }

    public int CertificateTemplateId { get; set; }

    public DateTime IssuedAt { get; set; }

    [StringLength(100)]
    public string CertificateNumber { get; set; } = null!;

    public bool IsActive { get; set; }

    [StringLength(500)]
    public string? FileUrl { get; set; }

    [ForeignKey("CertificateTemplateId")]
    [InverseProperty("IssuedCertificates")]
    public virtual CertificateTemplate CertificateTemplate { get; set; } = null!;

    [ForeignKey("CourseId")]
    [InverseProperty("IssuedCertificates")]
    public virtual Course Course { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("IssuedCertificates")]
    public virtual User User { get; set; } = null!;
}
