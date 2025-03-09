
import React, { useState } from 'react';
import { FolderPlus, Briefcase, Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';

// Sample data
const initialData = [
  { id: 1, name: "Website Redesign", client: "Acme Corp", manager: "John Doe", status: "Active", startDate: "2023-06-15", endDate: "2023-09-30" },
  { id: 2, name: "Mobile App Development", client: "TechStart Inc", manager: "Jane Smith", status: "Planning", startDate: "2023-08-01", endDate: "2023-12-15" },
  { id: 3, name: "CRM Implementation", client: "Global Services", manager: "Robert Johnson", status: "On Hold", startDate: "2023-05-10", endDate: "2023-10-30" },
  { id: 4, name: "Data Migration", client: "DataFlow LLC", manager: "Emily Davis", status: "Active", startDate: "2023-07-20", endDate: "2023-09-10" },
  { id: 5, name: "Security Audit", client: "SecureTech", manager: "Michael Wilson", status: "Completed", startDate: "2023-06-01", endDate: "2023-07-15" },
  { id: 6, name: "E-commerce Platform", client: "ShopNow Inc", manager: "Sarah Brown", status: "Active", startDate: "2023-04-15", endDate: "2023-10-15" },
  { id: 7, name: "Business Intelligence", client: "Insight Analytics", manager: "David Miller", status: "Planning", startDate: "2023-09-01", endDate: "2024-01-30" },
  { id: 8, name: "Cloud Migration", client: "SkyTech Solutions", manager: "Jessica Wilson", status: "Active", startDate: "2023-07-01", endDate: "2023-11-30" }
];

const columns = [
  { key: "name", header: "Project Name" },
  { key: "client", header: "Client" },
  { key: "manager", header: "Project Manager" },
  { key: "status", header: "Status" },
  { key: "startDate", header: "Start Date" },
  { key: "endDate", header: "End Date" },
];

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const ProjectForm = ({ project, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: project?.id || 0,
    name: project?.name || '',
    client: project?.client || '',
    manager: project?.manager || '',
    status: project?.status || 'Planning',
    startDate: project?.startDate ? formatDate(project.startDate) : '',
    endDate: project?.endDate ? formatDate(project.endDate) : '',
    description: project?.description || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter project name"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Input
            id="client"
            name="client"
            value={formData.client}
            onChange={handleChange}
            placeholder="Client name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="manager">Project Manager</Label>
          <Input
            id="manager"
            name="manager"
            value={formData.manager}
            onChange={handleChange}
            placeholder="Project manager"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleSelectChange('status', value)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Planning">Planning</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              className="pl-8"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className="pl-8"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Project description"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const { toast } = useToast();

  const handleCreateProject = () => {
    setCurrentProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project) => {
    setCurrentProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = (project) => {
    setCurrentProject(project);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitProject = (projectData) => {
    if (projectData.id === 0) {
      // Create new project
      const newProject = {
        ...projectData,
        id: Math.max(0, ...projects.map(p => p.id)) + 1
      };
      setProjects([newProject, ...projects]);
      toast({
        title: "Project Created",
        description: `"${newProject.name}" has been successfully created.`,
      });
    } else {
      // Update existing project
      setProjects(projects.map(project => 
        project.id === projectData.id ? projectData : project
      ));
      toast({
        title: "Project Updated",
        description: `"${projectData.name}" has been successfully updated.`,
      });
    }
    setIsModalOpen(false);
  };

  const confirmDeleteProject = () => {
    if (currentProject) {
      setProjects(projects.filter(project => project.id !== currentProject.id));
      toast({
        title: "Project Deleted",
        description: `"${currentProject.name}" has been removed.`,
        variant: "destructive",
      });
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage your ongoing and upcoming projects.</p>
        </div>
        <Button onClick={handleCreateProject} className="md:self-start animate-fade-in">
          <FolderPlus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
      />

      {/* Create/Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentProject ? "Edit Project" : "Create New Project"}
      >
        <ProjectForm
          project={currentProject}
          onSubmit={handleSubmitProject}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProject}>
              Delete
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">Are you sure you want to delete this project?</p>
            {currentProject && (
              <p className="text-muted-foreground mt-1">
                "{currentProject.name}" for {currentProject.client}
              </p>
            )}
            <p className="text-muted-foreground mt-4 text-sm">
              This action cannot be undone and will remove all project data.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
