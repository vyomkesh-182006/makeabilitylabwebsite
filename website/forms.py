from django import forms
from website.models import Position

class PositionModelForm(forms.ModelForm):

    class Meta:
        model = Position
        fields = '__all__'
        widgets = {
            'title': forms.Select(choices=Position.TITLE_CHOICES)
        }