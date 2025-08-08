"use server";

import { custom, z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const formSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error:'Please select a Customer'
  }),
  amount: z.coerce.number().gt(0,{message:'Please enter an amount greater than $0'}),
  status: z.enum(["pending", "paid"],{
    invalid_type_error: 'Please select an invoice status'
  }),
  date: z.string(),
});

export type State={
  errors?:{
    customerId?:string[];
    amount?:string[];
    status?:string[];
  };
  message?:string|null;
};

const CreateInvoice = formSchema.omit({ id: true, date: true });
export async function createInvoice(prevState:State,formData: FormData) {
    const validdatedFields = CreateInvoice.safeParse({
      customerId: formData.get("customerId"),
      amount: formData.get("amount"),
      status: formData.get("status"),
    });
    if(!validdatedFields.success){
      return {
        errors:validdatedFields.error.flatten().fieldErrors,
        message:'Missing Fields. Failed to Create Invoice',
      };
    }
    const{customerId,amount,status}=validdatedFields.data;
    const amountInCent = amount * 100;
    const date = new Date().toISOString().split("t")[0];
    try {
    await sql`INSERT INTO invoices(customer_id,amount,status,date)
    VALUES (${customerId},${amountInCent},${status},${date})`;

    } catch (error) {
    console.error(error);
    return {
      //if a databases error , return a more Specific error
      message:'Database Error: Failed to Create Invoice'
    }
  }
    revalidatePath("/dashboard/invoices");
    redirect("/dashboard/invoices");
  
  // const rawFormData={
  //     customerId:formData.get('customerId'),
  //     amount:formData.get('amount'),
  //     status:formData.get('status'),
  // };
  // console.log(rawFormData);
  // console.log(typeof rawFormData.amount);
}
const UpdateInvoice = formSchema.omit({ id: true, date: true });
export async function updateInvoice(id: string,prevState:State, formData: FormData) {
  
    
    const validdatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  if(!validdatedFields.success){
    return {
        errors:validdatedFields.error.flatten().fieldErrors,
        message:'Missing Fields. Failed to Update Invoice',
      };
  }
  const{customerId,amount,status}=validdatedFields.data;
  const amountInCent = amount * 100;
  try {
  await sql`
    UPDATE invoices
    SET customer_id=${customerId},amount=${amountInCent},status=${status}
    WHERE id=${id}`;
    } catch (error) {
    console.error(error);
    return {
      message:'Database Error: Failed to Update Invoice. '
    };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
  
}

export async function deleteInvoice(id: string) {
    // throw new Error("Failed to delete");
    try {
  await sql`DELETE FROM  invoices WHERE id=${id}`;
  }catch(error){
        console.error(error);
    }
  revalidatePath("/dashboard/invoices");
    
}
