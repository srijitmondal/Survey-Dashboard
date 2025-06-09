"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, CheckCircle, X } from "lucide-react"
import { mockSurveys, type Survey } from "@/lib/auth"

export default function SurveyManagement() {
  const [surveys, setSurveys] = useState<Survey[]>(mockSurveys)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSurvey, setNewSurvey] = useState({
    aoi_id: "",
    surveyor_id: "",
  })

  const handleAddSurvey = () => {
    const survey: Survey = {
      id: Date.now().toString(),
      ...newSurvey,
      synced_at: new Date().toISOString(),
      status: "pending",
    }
    setSurveys([...surveys, survey])
    setNewSurvey({ aoi_id: "", surveyor_id: "" })
    setShowAddModal(false)
  }

  const handleValidateSurvey = (surveyId: string) => {
    setSurveys(surveys.map((survey) => (survey.id === surveyId ? { ...survey, status: "complete" as const } : survey)))
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 border-white/20 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Survey Management</CardTitle>
          <Button onClick={() => setShowAddModal(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Survey
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-gray-300">Survey ID</TableHead>
                  <TableHead className="text-gray-300">AOI ID</TableHead>
                  <TableHead className="text-gray-300">Surveyor ID</TableHead>
                  <TableHead className="text-gray-300">Synced At</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id} className="border-white/20 hover:bg-white/5">
                    <TableCell className="text-white">{survey.id}</TableCell>
                    <TableCell className="text-white">{survey.aoi_id}</TableCell>
                    <TableCell className="text-white">{survey.surveyor_id}</TableCell>
                    <TableCell className="text-white">{new Date(survey.synced_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          survey.status === "complete"
                            ? "bg-green-600/20 text-green-300"
                            : "bg-yellow-600/20 text-yellow-300"
                        }`}
                      >
                        {survey.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleValidateSurvey(survey.id)}
                        className="text-green-400 hover:text-green-300 hover:bg-green-600/20"
                        disabled={survey.status === "complete"}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Survey Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-md max-w-md w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Add New Survey</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">AOI ID</label>
                <Input
                  value={newSurvey.aoi_id}
                  onChange={(e) => setNewSurvey({ ...newSurvey, aoi_id: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="AOI_001"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Surveyor ID</label>
                <Input
                  value={newSurvey.surveyor_id}
                  onChange={(e) => setNewSurvey({ ...newSurvey, surveyor_id: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Surveyor ID"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddSurvey} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Add Survey
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
