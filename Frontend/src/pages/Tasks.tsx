
import React, { useState } from 'react';
import { ClipboardPlus, Calendar, Info } from 'lucide-react';
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
  { id: 1, title: "Update website content", assignee: "John Doe", priority: "High", status: "In Progress", dueDate: "2023-08-15" },
  { id: 2, title: "Fix login issue", assignee: "Jane Smith", priority: "Critical", status: "Pending", dueDate: "2023-08-10" },
  { id: 3, title: "Create user documentation", assignee: "Robert Johnson", priority: "Medium", status: "Completed", dueDate: "2023-08-05" },
  { id: 4, title: "Test new features", assignee: "Emily Davis", priority: "High", status: "In Progress", dueDate: "2023-08-18" },
  { id: 5, title: "Update dependencies", assignee: "Michael Wilson", priority: "Low", status: "Pending", dueDate: "2023-08-25" },
  { id: 6, title: "Design new logo", assignee: "Sarah Brown", priority: "Medium", status: "In Progress", dueDate: "2023-08-20" },
  { id: 7, title: "Fix responsive layout", assignee: "David Miller", priority: "High", status: "Completed", dueDate: "2023-08-03" },
  { id: 8, title: "Implement analytics", assignee: "Jessica Wilson", priority: "Medium", status: "Pending", dueDate: "2023-08-22" },
  { id: 9, title: "Setup CI/CD pipeline", assignee: "Thomas Anderson", priority: "Critical", status: "In Progress", dueDate: "2023-08-12" },
  { id: 10, title: "Optimize database queries", assignee: "Lisa Taylor", priority: "High", status: "Pending", dueDate: "2023-08-16" },
  { id: 11, title: "Update privacy policy", assignee: "James Martin", priority: "Medium", status: "Completed", dueDate: "2023-08-02" },
  { id: 12, title: "Review pull requests", assignee: "Jennifer Lewis", priority: "Low", status: "In Progress", dueDate: "2023-08-19" }
];

const columns = [
  { key: "title", header: "Task Title" },
  { key: "assignee", header: "Assignee" },
  { key: "priority", header: "Priority" },
  { key: "status", header: "Status" },
  { key: "dueDate", header: "Due Date" },
];

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: task?.id || 0,
    title: task?.title || '',
    assignee: task?.assignee || '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'Pending',
    dueDate: task?.dueDate ? formatDate(task.dueDate) : '',
    description: task?.description || '',
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
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="assignee">Assignee</Label>
        <Input
          id="assignee"
          name="assignee"
          value={formData.assignee}
          onChange={handleChange}
          placeholder="Assign to"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={formData.priority}
            onValueChange={(value) => handleSelectChange('priority', value)}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
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
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <div className="relative">
          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            className="pl-8"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Task description"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const { toast } = useToast();

  const handleCreateTask = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (task) => {
    setCurrentTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitTask = (taskData) => {
    if (taskData.id === 0) {
      // Create new task
      const newTask = {
        ...taskData,
        id: Math.max(0, ...tasks.map(t => t.id)) + 1
      };
      setTasks([newTask, ...tasks]);
      toast({
        title: "Task Created",
        description: `"${newTask.title}" has been successfully created.`,
      });
    } else {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === taskData.id ? taskData : task
      ));
      toast({
        title: "Task Updated",
        description: `"${taskData.title}" has been successfully updated.`,
      });
    }
    setIsModalOpen(false);
  };

  const confirmDeleteTask = () => {
    if (currentTask) {
      setTasks(tasks.filter(task => task.id !== currentTask.id));
      toast({
        title: "Task Deleted",
        description: `"${currentTask.title}" has been removed.`,
        variant: "destructive",
      });
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">Manage and track your team's tasks and activities.</p>
        </div>
        <Button onClick={handleCreateTask} className="md:self-start animate-fade-in">
          <ClipboardPlus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={tasks}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />

      {/* Create/Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentTask ? "Edit Task" : "Create New Task"}
      >
        <TaskForm
          task={currentTask}
          onSubmit={handleSubmitTask}
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
            <Button variant="destructive" onClick={confirmDeleteTask}>
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
            <p className="font-medium">Are you sure you want to delete this task?</p>
            {currentTask && (
              <p className="text-muted-foreground mt-1">
                "{currentTask.title}"
              </p>
            )}
            <p className="text-muted-foreground mt-4 text-sm">
              This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
