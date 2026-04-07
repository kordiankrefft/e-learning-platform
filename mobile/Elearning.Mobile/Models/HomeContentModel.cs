namespace Elearning.Mobile.Models;

public class HeroContent
{
    public string Title { get; set; } = "";
    public string Highlight { get; set; } = "";
    public string Description { get; set; } = "";
    public List<string> Bullets { get; set; } = [];
    public HeroCta PrimaryCta { get; set; } = new();
    public HeroSecondaryCta SecondaryCta { get; set; } = new();
}
public class CarouselSlideVm
{
    public string Label { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string? MediaFileUrl { get; set; }
    public string? ImageUrl { get; set; }
}
public class CarouselSlideContent
{
    public string Label { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
}

public class HeroCta
{
    public string Label { get; set; } = "";
    public string To { get; set; } = ""; 
}

public class HeroSecondaryCta
{
    public string Label { get; set; } = "";
    public string Hash { get; set; } = ""; 
}

public class HowItWorksContent
{
    public string SectionId { get; set; } = "";
    public string Title { get; set; } = "";
    public List<HowItWorksItem> Items { get; set; } = [];
}

public class HowItWorksItem
{
    public string Title { get; set; } = "";
    public string Text { get; set; } = "";
}

public class BenefitsContent
{
    public string SectionId { get; set; } = "";
    public string Title { get; set; } = "";
    public List<BenefitItem> Items { get; set; } = [];
}

public class BenefitItem
{
    public string Icon { get; set; } = "";
    public string Title { get; set; } = "";
    public string Text { get; set; } = "";
}

public class CtaContent
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public HeroCta Cta { get; set; } = new();
}
