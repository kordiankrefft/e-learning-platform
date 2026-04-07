using System;
using System.Text.Json.Serialization;

namespace Data.Dtos.SupportTicket
{
    public class SupportTicketDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        [JsonPropertyName("userName")]
        public string UserName { get; set; } = null!;

        [JsonPropertyName("courseId")]
        public int? CourseId { get; set; }

        [JsonPropertyName("courseTitle")]
        public string? CourseTitle { get; set; }

        [JsonPropertyName("assignedTutorId")]
        public int? AssignedTutorId { get; set; }

        [JsonPropertyName("assignedTutorName")]
        public string? AssignedTutorName { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = null!;

        [JsonPropertyName("status")]
        public string Status { get; set; } = null!;

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("closedAt")]
        public DateTime? ClosedAt { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
