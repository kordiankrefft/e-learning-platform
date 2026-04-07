using System;
using System.Text.Json.Serialization;

namespace Data.Dtos.IssuedCertificate
{
    public class IssuedCertificateDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        [JsonPropertyName("userName")]
        public string UserName { get; set; } = null!;

        [JsonPropertyName("courseId")]
        public int CourseId { get; set; }

        [JsonPropertyName("courseTitle")]
        public string CourseTitle { get; set; } = null!;

        [JsonPropertyName("certificateTemplateId")]
        public int CertificateTemplateId { get; set; }

        [JsonPropertyName("certificateTemplateName")]
        public string CertificateTemplateName { get; set; } = null!;

        [JsonPropertyName("issuedAt")]
        public DateTime IssuedAt { get; set; }

        [JsonPropertyName("certificateNumber")]
        public string CertificateNumber { get; set; } = null!;

        [JsonPropertyName("fileUrl")]
        public string? FileUrl { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
