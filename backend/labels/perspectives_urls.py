from rest_framework.routers import DefaultRouter
from .perspectives_api import PerspectiveViewSet, AnnotationPerspectiveViewSet

router = DefaultRouter()
router.register(r'perspectives', PerspectiveViewSet, basename='perspectives')
router.register(r'annotation-perspectives', AnnotationPerspectiveViewSet, basename='annotation-perspectives')

urlpatterns = router.urls
