using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.Announcement
{
    public class AnnouncementCreateDto
    {
        [JsonPropertyName("title")]
        [Required, StringLength(200)]
        public string? Title { get; set; }

        [JsonPropertyName("body")]
        [Required]
        public string? Body { get; set; }

        [JsonPropertyName("isPublished")]
        public bool IsPublished { get; set; }

        [JsonPropertyName("publishAt")]
        public DateTime? PublishAt { get; set; }

        [JsonPropertyName("expiresAt")]
        public DateTime? ExpiresAt { get; set; }
    }
}
