
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText, CheckCircle, Clock, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Survey {
  id: string;
  aoi_id: string;
  surveyor_id: string;
  synced_at: string;
  name: string;
  status: 'pending' | 'completed' | 'validated';
  markerCount: number;
}

const mockSurveys: Survey[] = [
  { 
    id: '1', 
    aoi_id: 'AOI001', 
    surveyor_id: 'user1', 
    synced_at: '2024-01-15T10:30:00Z', 
    name: 'Downtown Survey',
    status: 'completed',
    markerCount: 15
  },
  { 
    id: '2', 
    aoi_id: 'AOI002', 
    surveyor_id: 'user2', 
    synced_at: '2024-01-16T14:20:00Z', 
    name: 'Park Area Survey',
    status: 'pending',
    markerCount: 8
  },
  { 
    id: '3', 
    aoi_id: 'AOI003', 
    surveyor_id: 'user1', 
    synced_at: '2024-01-17T09:15:00Z', 
    name: 'Industrial Zone Survey',
    status: 'validated',
    markerCount: 22
  },
];

const ManageSurveys = () => {
  const [surveys, setSurveys] = useState<Survey[]>(mockSurveys);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    name: '',
    aoi_id: '',
    surveyor_id: '',
  });

  const handleAddSurvey = () => {
    if (!newSurvey.name || !newSurvey.aoi_id || !newSurvey.surveyor_id) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const survey: Survey = {
      id: Date.now().toString(),
      name: newSurvey.name,
      aoi_id: newSurvey.aoi_id,
      surveyor_id: newSurvey.surveyor_id,
      synced_at: new Date().toISOString(),
      status: 'pending',
      markerCount: 0,
    };

    setSurveys([...surveys, survey]);
    setNewSurvey({ name: '', aoi_id: '', surveyor_id: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Survey added successfully",
    });
  };

  const handleStatusChange = (surveyId: string, newStatus: Survey['status']) => {
    setSurveys(surveys.map(survey => 
      survey.id === surveyId 
        ? { ...survey, status: newStatus }
        : survey
    ));
    
    toast({
      title: "Status Updated",
      description: `Survey status changed to ${newStatus}`,
    });
  };

  const getStatusBadge = (status: Survey['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-600"><FileText className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'validated':
        return <Badge variant="secondary" className="bg-emerald-600"><CheckCircle className="w-3 h-3 mr-1" />Validated</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Manage Surveys</h2>
          <p className="text-gray-400">View and manage all survey data</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Survey
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Add New Survey</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new survey entry in the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="survey-name">Survey Name</Label>
                <Input
                  id="survey-name"
                  placeholder="Enter survey name"
                  value={newSurvey.name}
                  onChange={(e) => setNewSurvey({ ...newSurvey, name: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aoi-id">Area of Interest ID</Label>
                <Input
                  id="aoi-id"
                  placeholder="Enter AOI ID"
                  value={newSurvey.aoi_id}
                  onChange={(e) => setNewSurvey({ ...newSurvey, aoi_id: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surveyor-id">Surveyor ID</Label>
                <Input
                  id="surveyor-id"
                  placeholder="Enter surveyor ID"
                  value={newSurvey.surveyor_id}
                  onChange={(e) => setNewSurvey({ ...newSurvey, surveyor_id: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSurvey} className="bg-blue-600 hover:bg-blue-700">
                  Add Survey
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <Card key={survey.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-white text-lg">{survey.name}</CardTitle>
                </div>
                {getStatusBadge(survey.status)}
              </div>
              <CardDescription className="text-gray-400">
                AOI: {survey.aoi_id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Surveyor:</span>
                  <span className="text-white">{survey.surveyor_id}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Markers:</span>
                  <div className="flex items-center text-white">
                    <MapPin className="w-3 h-3 mr-1" />
                    {survey.markerCount}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Synced:</span>
                  <span className="text-white">
                    {new Date(survey.synced_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  {survey.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(survey.id, 'completed')}
                      className="bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      Mark Complete
                    </Button>
                  )}
                  {survey.status === 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(survey.id, 'validated')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                    >
                      Validate
                    </Button>
                  )}
                  {survey.status === 'validated' && (
                    <Badge variant="secondary" className="bg-emerald-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validated
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {surveys.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No surveys found</h3>
            <p className="text-gray-400 text-center mb-4">
              Get started by adding your first survey to the system
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Survey
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManageSurveys;
