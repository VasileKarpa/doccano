from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status, views
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import RetrieveDestroyAPIView
from rest_framework.views import APIView

from projects.models import Project
from projects.permissions import IsProjectAdmin, IsProjectStaffAndReadOnly
from projects.serializers import ProjectPolymorphicSerializer

from projects.models import Perspective
from projects.serializers import PerspectiveSerializer

from examples.models import Example
from labels.models import Span, Category


class ProjectList(generics.ListCreateAPIView):
    serializer_class = ProjectPolymorphicSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("name", "description")
    ordering_fields = ["name", "created_at", "created_by", "project_type"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.request.method == "GET":
            self.permission_classes = [
                IsAuthenticated,
            ]
        else:
            self.permission_classes = [IsAuthenticated & IsAdminUser]
        return super().get_permissions()

    def get_queryset(self):
        return Project.objects.filter(role_mappings__user=self.request.user)

    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        project.add_admin()

    def delete(self, request, *args, **kwargs):
        delete_ids = request.data["ids"]
        projects = Project.objects.filter(
            role_mappings__user=self.request.user,
            role_mappings__role__name=settings.ROLE_PROJECT_ADMIN,
            pk__in=delete_ids,
        )
        # Todo: I want to use bulk delete.
        # But it causes the constraint error.
        # See https://github.com/django-polymorphic/django-polymorphic/issues/229
        for project in projects:
            project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectPolymorphicSerializer
    lookup_url_kwarg = "project_id"
    permission_classes = [IsAuthenticated & (IsProjectAdmin | IsProjectStaffAndReadOnly)]


class CloneProject(views.APIView):
    permission_classes = [IsAuthenticated & IsProjectAdmin]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        project = get_object_or_404(Project, pk=self.kwargs["project_id"])
        cloned_project = project.clone()
        serializer = ProjectPolymorphicSerializer(cloned_project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PerspectiveListCreateView(generics.ListCreateAPIView):
    serializer_class = PerspectiveSerializer
    permission_classes = [IsAuthenticated & IsProjectAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["project"]
    ordering_fields = ["name"]
    ordering = ["name"]
    queryset = Perspective.objects.all()
    lookup_url_kwarg = "perspective_id"
    http_method_names = [
        "get",
        "post",
    ]

    def dispatch(self, request, *args, **kwargs):
        print(">>> dispatch chamado com kwargs:", kwargs)
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        try:
            project_id = self.kwargs.get("project_id")
            print(">>> PerspectiveListCreateView: project_id recebido:", project_id)
            qs = Perspective.objects.filter(project_id=project_id)
            print(">>> Queryset count:", qs.count())
            return qs
        except Exception as e:
            print(">>> Erro em get_queryset:", e)
            raise e


    def get_queryset2(self):
        project_id = self.kwargs.get("project_id")
        print(">>> get_queryset chamado com project_id:", project_id)
        qs = Perspective.objects.filter(project_id=project_id)
        print(">>> queryset count:", qs.count())
        return qs

    def perform_create(self, serializer):
        try:
            project_id = self.kwargs.get("project_id")
            print(">>> perform_create: project_id recebido:", project_id)
            project = get_object_or_404(Project, pk=project_id)
            print(">>> perform_create: Projeto encontrado:", project)
            serializer.save(project=project, created_by=self.request.user)
            print(">>> perform_create: Perspectiva criada com sucesso")
        except Exception as e:
            print(">>> Erro em perform_create:", e)
            raise e



    def perform_destroy(self, instance):
        if instance.project.examples.exists():
            return Response(
                {"detail": "Cannot delete perspectives already in use."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        super().perform_destroy(instance)

class PerspectiveDetailView(RetrieveDestroyAPIView):
    serializer_class = PerspectiveSerializer
    permission_classes = [IsAuthenticated & IsProjectAdmin]  # Ou ajuste conforme necessário
    queryset = Perspective.objects.all()
    lookup_url_kwarg = "perspective_id"

class ProjectAnnotationsView(APIView):
    permission_classes = [IsAuthenticated & (IsProjectAdmin | IsProjectStaffAndReadOnly)]

    def get(self, request, project_id):
        """
        List all annotations for examples in a project and calculate label distribution
        """
        try:
            # Verificar se o projeto existe
            project = get_object_or_404(Project, id=project_id)
            
            # Buscar todos os exemplos do projeto
            examples = Example.objects.filter(project_id=project_id)
            
            # Dicionários para armazenar contagens de labels
            span_label_counts = {}
            category_label_counts = {}
            total_spans = 0
            total_categories = 0
            
            # Organizar as anotações por exemplo
            annotation_data = {}
            for example in examples:
                example_id = example.id
                annotation_data[example_id] = {
                    'example_text': example.text,
                    'annotations': []
                }
                
                # Buscar anotações de sequence labeling (spans)
                spans = Span.objects.filter(example=example)
                for span in spans:
                    label_text = span.label.text
                    span_label_counts[label_text] = span_label_counts.get(label_text, 0) + 1
                    total_spans += 1
                    
                    annotation_info = {
                        'type': 'span',
                        'user': span.user.username,
                        'label': label_text,
                        'start_offset': span.start_offset,
                        'end_offset': span.end_offset,
                        'text': example.text[span.start_offset:span.end_offset],
                        'created_at': span.created_at
                    }
                    annotation_data[example_id]['annotations'].append(annotation_info)
                
                # Buscar anotações de text classification (categories)
                categories = Category.objects.filter(example=example)
                for category in categories:
                    label_text = category.label.text
                    category_label_counts[label_text] = category_label_counts.get(label_text, 0) + 1
                    total_categories += 1
                    
                    annotation_info = {
                        'type': 'category',
                        'user': category.user.username,
                        'label': label_text,
                        'created_at': category.created_at
                    }
                    annotation_data[example_id]['annotations'].append(annotation_info)
            
            # Calcular porcentagens para cada tipo de label
            span_label_distribution = {
                label: {
                    'count': count,
                    'percentage': round((count / total_spans * 100) if total_spans > 0 else 0, 2)
                }
                for label, count in span_label_counts.items()
            }
            
            category_label_distribution = {
                label: {
                    'count': count,
                    'percentage': round((count / total_categories * 100) if total_categories > 0 else 0, 2)
                }
                for label, count in category_label_counts.items()
            }
            
            return Response({
                'project_id': project_id,
                'examples': annotation_data,
                'label_distribution': {
                    'sequence_labeling': span_label_distribution,
                    'text_classification': category_label_distribution
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )