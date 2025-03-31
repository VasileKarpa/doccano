from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from django.apps import apps
from .serializers import PerspectiveSerializer, AnnotationPerspectiveSerializer
from labels.models import AnnotationPerspective, Perspective

# ViewSets
class PerspectiveViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Perspective.objects.all()
    serializer_class = PerspectiveSerializer
    permission_classes = [IsAuthenticated]

class AnnotationPerspectiveViewSet(viewsets.ModelViewSet):
    queryset = AnnotationPerspective.objects.all()
    serializer_class = AnnotationPerspectiveSerializer
    permission_classes = [IsAuthenticated]
