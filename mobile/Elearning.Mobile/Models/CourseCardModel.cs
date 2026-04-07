namespace Elearning.Mobile.Models;

public class CourseCardVm
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? ShortDescription { get; set; }
    public string? LongDescription { get; set; }
    public string? DifficultyLevel { get; set; }
    public string Status { get; set; } = "";
    public string? ThumbnailUrl { get; set; }   
    public string? ImageUrl { get; set; }         
}
