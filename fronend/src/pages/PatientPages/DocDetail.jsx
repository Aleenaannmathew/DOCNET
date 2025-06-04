import React from 'react'
import DoctorDetailPage from '../../components/PatientComponent/DoctorDetails'
import { useParams } from 'react-router-dom'

function DocDetail() {
    const { slug } = useParams();
  return (
    <div>
      <DoctorDetailPage slug = {slug} />
    </div>
  )
}

export default DocDetail
