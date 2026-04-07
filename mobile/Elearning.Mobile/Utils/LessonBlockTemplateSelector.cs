using Elearning.Mobile.ViewModels.LessonBlocks;

namespace Elearning.Mobile.Utils;

public class LessonBlockTemplateSelector : DataTemplateSelector
{
    public DataTemplate? TextTemplate { get; set; }
    public DataTemplate? SingleChoiceTemplate { get; set; }
    public DataTemplate? FillBlankTemplate { get; set; }

    protected override DataTemplate OnSelectTemplate(object item, BindableObject container)
    {
        return item switch
        {
            TextBlockViewModel => TextTemplate!,
            SingleChoiceBlockViewModel => SingleChoiceTemplate!,
            FillBlankBlockViewModel => FillBlankTemplate!,
            _ => TextTemplate!
        };
    }
}
   