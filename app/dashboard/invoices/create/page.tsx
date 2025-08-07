import { customers } from '@/app/lib/placeholder-data'
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs'
import Form from '@/app/ui/invoices/create-form'
import React from 'react'

export default function page() {
  return (
    <main>
        <Breadcrumbs
        breadcrumbs={[
            {label:'Invoices',href:'/dashboard/invoices'},
            {
                label:'Create Invoices',
                href:'/dashboard/invoices/create',
                active:true,  
            },
        ]}
        />
        <Form customers={customers}/>
    </main>
  )
}

 