namespace Elearning.Mobile.Models;

public class AnnouncementBodyBase
{
    public string Type { get; set; } = "";
    public string Description { get; set; } = "";
}

public class PricePromoBody : AnnouncementBodyBase
{
    public decimal OldPrice { get; set; }
    public decimal NewPrice { get; set; }
    public string Currency { get; set; } = "zł";
}

public class DurationPromoBody : AnnouncementBodyBase
{
    public int OldDays { get; set; }
    public int NewDays { get; set; }
}
