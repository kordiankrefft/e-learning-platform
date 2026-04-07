using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("CertificateTemplate")]
public partial class CertificateTemplate
{
    [Key]
    public int CertificateTemplateId { get; set; }

    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    public string TemplateBody { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    [InverseProperty("CertificateTemplate")]
    public virtual ICollection<IssuedCertificate> IssuedCertificates { get; set; } = new List<IssuedCertificate>();
}
