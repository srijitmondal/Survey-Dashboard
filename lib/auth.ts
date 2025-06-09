export interface User {
  id: string
  email: string
  phone_number: string
  name: string
  role: "admin" | "user"
}

// Update the Survey interface to include a completion status
export interface Survey {
  id: string
  aoi_id: string
  surveyor_id: string
  synced_at: string
  status: "pending" | "complete"
}

export interface Marker {
  id: string
  aoi_id: string
  surveyor_id: string
  synced_at: string
}

export interface Marker {
  id: string
  survey_id: string
  marker_id: string
  timestamp: string
  latitude: number
  longitude: number
}

export interface CenterImage {
  id: string
  marker_id: string
  url: string
  device_model: string
  manufacturer: string
  timestamp: string
  width: number
  height: number
  format: string
}

export interface BranchImage {
  id: string
  marker_id: string
  url: string
  heading: number
  device_model: string
  manufacturer: string
  timestamp: string
  width: number
  height: number
  format: string
}

// Mock data
export const mockUsers: User[] = [
  { id: "1", email: "admin@atomz.com", phone_number: "+1234567890", name: "Admin User", role: "admin" },
  { id: "2", email: "user@atomz.com", phone_number: "+1234567891", name: "Survey User", role: "user" },
  { id: "3", email: "john@atomz.com", phone_number: "+1234567892", name: "John Surveyor", role: "user" },
]

// Update the mockSurveys data to include the status field
export const mockSurveys: Survey[] = [
  { id: "1", aoi_id: "AOI_001", surveyor_id: "2", synced_at: "2024-01-15T10:30:00Z", status: "pending" },
  { id: "2", aoi_id: "AOI_002", surveyor_id: "3", synced_at: "2024-01-16T14:20:00Z", status: "pending" },
  { id: "3", aoi_id: "AOI_003", surveyor_id: "2", synced_at: "2024-01-17T09:15:00Z", status: "complete" },
]

export const mockMarkers: Marker[] = [
  {
    id: "1",
    survey_id: "1",
    marker_id: "M001",
    timestamp: "2024-01-15T10:30:00Z",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: "2",
    survey_id: "1",
    marker_id: "M002",
    timestamp: "2024-01-15T10:35:00Z",
    latitude: 40.713,
    longitude: -74.0058,
  },
  {
    id: "3",
    survey_id: "2",
    marker_id: "M003",
    timestamp: "2024-01-16T14:20:00Z",
    latitude: 40.7125,
    longitude: -74.0065,
  },
]

export const mockCenterImages: CenterImage[] = [
  {
    id: "1",
    marker_id: "M001",
    url: "/placeholder.svg?height=300&width=400",
    device_model: "iPhone 14",
    manufacturer: "Apple",
    timestamp: "2024-01-15T10:30:00Z",
    width: 400,
    height: 300,
    format: "JPG",
  },
  {
    id: "2",
    marker_id: "M002",
    url: "/placeholder.svg?height=300&width=400",
    device_model: "Pixel 7",
    manufacturer: "Google",
    timestamp: "2024-01-15T10:35:00Z",
    width: 400,
    height: 300,
    format: "JPG",
  },
]

export const mockBranchImages: BranchImage[] = [
  {
    id: "1",
    marker_id: "M001",
    url: "/placeholder.svg?height=300&width=400",
    heading: 45,
    device_model: "iPhone 14",
    manufacturer: "Apple",
    timestamp: "2024-01-15T10:30:00Z",
    width: 400,
    height: 300,
    format: "JPG",
  },
  {
    id: "2",
    marker_id: "M002",
    url: "/placeholder.svg?height=300&width=400",
    heading: 180,
    device_model: "Pixel 7",
    manufacturer: "Google",
    timestamp: "2024-01-15T10:35:00Z",
    width: 400,
    height: 300,
    format: "JPG",
  },
]

export const authenticateUser = (email: string, password: string): User | null => {
  // Simple mock authentication
  const user = mockUsers.find((u) => u.email === email)
  if (user && password === "password") {
    return user
  }
  return null
}
