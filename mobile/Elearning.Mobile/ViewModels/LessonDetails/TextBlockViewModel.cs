namespace Elearning.Mobile.ViewModels.LessonBlocks;

public class TextBlockViewModel : LessonBlockBaseViewModel
{
    public string Text { get; }

    public TextBlockViewModel(int id, string text)
        : base(id, "text")
    {
        Text = text ?? "";
    }
}
