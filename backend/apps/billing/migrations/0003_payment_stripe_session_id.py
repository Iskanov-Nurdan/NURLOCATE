from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("billing", "0002_invoice"),
    ]

    operations = [
        migrations.AddField(
            model_name="payment",
            name="stripe_session_id",
            field=models.CharField(blank=True, default="", max_length=256),
            preserve_default=False,
        ),
    ]
