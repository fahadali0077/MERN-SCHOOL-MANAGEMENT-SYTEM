import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateStudentMutation } from '../../store/api/endpoints';
import { useGetClassesQuery } from '../../store/api/endpoints';
import { ArrowLeft, Loader2, UserPlus, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWindowTitle } from '../../hooks';

const nameRegex = /^[a-zA-Z\s'\-]+$/;

const schema = z.object({
  firstName:       z.string().min(2, 'At least 2 characters').max(50, 'Too long').regex(nameRegex, 'Letters only'),
  lastName:        z.string().min(2, 'At least 2 characters').max(50, 'Too long').regex(nameRegex, 'Letters only'),
  email:           z.string().email('Enter a valid email'),
  phone:           z.string().regex(/^[\+\d\s\-()]{7,20}$/, 'Invalid phone number').optional().or(z.literal('')),
  classId:         z.string().min(1, 'Select a class'),
  rollNumber:      z.string().min(1, 'Required').max(20, 'Too long'),
  gender:          z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string().optional().refine(val => {
    if (!val) return true;
    const d = new Date(val);
    const now = new Date();
    const minAge = new Date(); minAge.setFullYear(now.getFullYear() - 25);
    const maxAge = new Date(); maxAge.setFullYear(now.getFullYear() - 3);
    return d >= minAge && d <= maxAge;
  }, 'Date of birth must be between 3 and 25 years ago'),
  admissionDate: z.string().min(1, 'Required').refine(val => {
    const d = new Date(val);
    const now = new Date();
    const tenYearsAgo = new Date(); tenYearsAgo.setFullYear(now.getFullYear() - 10);
    return d >= tenYearsAgo && d <= now;
  }, 'Admission date must be within the last 10 years'),
  bloodGroup:      z.string().optional(),
  feeCategory:     z.string().default('regular'),
  guardianName:    z.string().max(100, 'Too long').optional().or(z.literal('')),
  guardianPhone:   z.string().regex(/^[\+\d\s\-()]{7,20}$/, 'Invalid phone').optional().or(z.literal('')),
  guardianRelation:z.string().max(50, 'Too long').optional().or(z.literal('')),
  currentStreet:   z.string().max(200, 'Too long').optional().or(z.literal('')),
  currentCity:     z.string().max(100, 'Too long').optional().or(z.literal('')),
  currentState:    z.string().max(100, 'Too long').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const steps = ['Personal Info', 'Academic', 'Guardian', 'Address'];

export default function AddStudent() {
  useWindowTitle('Add Student');
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const [createStudent, { isLoading }] = useCreateStudentMutation();
  const { data: classesData } = useGetClassesQuery();
  const classes = classesData?.data || [];

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { admissionDate: new Date().toISOString().split('T')[0], feeCategory: 'regular' }
  });

  const nextStep = async () => {
    const fields: Record<number, (keyof FormData)[]> = {
      0: ['firstName', 'lastName', 'email', 'gender'],
      1: ['classId', 'rollNumber', 'admissionDate'],
      2: [],
      3: [],
    };
    const valid = await trigger(fields[step]);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        classId: data.classId,
        rollNumber: data.rollNumber,
        admissionDate: data.admissionDate,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        bloodGroup: data.bloodGroup,
        feeCategory: data.feeCategory,
        guardian: {
          name: data.guardianName,
          phone: data.guardianPhone,
          relation: data.guardianRelation,
        },
        address: {
          current: {
            street: data.currentStreet,
            city: data.currentCity,
            state: data.currentState,
          }
        }
      };
      await createStudent(payload).unwrap();
      toast.success('Student added successfully! Welcome email sent.');
      navigate('/dashboard/students');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add student');
    }
  };

  const Field = ({ label, name, type = 'text', placeholder, required = false, children }: any) => (
    <div>
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {label}{required && <span className="text-danger ml-1">*</span>}
      </label>
      {children || (
        <input {...register(name)} type={type} placeholder={placeholder} className="input mt-1.5" />
      )}
      {errors[name as keyof typeof errors] && (
        <p className="text-danger text-xs mt-1">{(errors[name as keyof typeof errors] as any)?.message}</p>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-up">
        <Link to="/dashboard/students" className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Add Student</h1>
          <p className="text-text-secondary text-sm">Fill in the details to enroll a new student</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 animate-fade-up animate-fade-up-delay-1">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              i === step ? 'bg-accent text-white' :
              i < step ? 'bg-success/20 text-success' : 'bg-white/5 text-text-tertiary'
            }`}>
              <span>{i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight size={14} className="text-text-tertiary flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card p-6 space-y-4 animate-fade-up animate-fade-up-delay-2">

          {/* Step 0: Personal Info */}
          {step === 0 && (
            <>
              <h2 className="font-display font-semibold text-lg text-text-primary">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" name="firstName" placeholder="John" required />
                <Field label="Last Name" name="lastName" placeholder="Doe" required />
              </div>
              <Field label="Email Address" name="email" type="email" placeholder="student@school.edu" required />
              <Field label="Phone" name="phone" placeholder="+1 234 567 890" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Gender" name="gender" required>
                  <select {...register('gender')} className="input mt-1.5">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Date of Birth" name="dateOfBirth" type="date" />
              </div>
              <Field label="Blood Group" name="bloodGroup">
                <select {...register('bloodGroup')} className="input mt-1.5">
                  <option value="">Select blood group</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
            </>
          )}

          {/* Step 1: Academic */}
          {step === 1 && (
            <>
              <h2 className="font-display font-semibold text-lg text-text-primary">Academic Details</h2>
              <Field label="Class" name="classId" required>
                <select {...register('classId')} className="input mt-1.5">
                  <option value="">Select class</option>
                  {classes.map((cls: any) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} {cls.section} (Grade {cls.grade})
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Roll Number" name="rollNumber" placeholder="e.g. 001" required />
                <Field label="Admission Date" name="admissionDate" type="date" required />
              </div>
              <Field label="Fee Category" name="feeCategory">
                <select {...register('feeCategory')} className="input mt-1.5">
                  <option value="regular">Regular</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="staff_ward">Staff Ward</option>
                  <option value="ews">EWS</option>
                </select>
              </Field>
            </>
          )}

          {/* Step 2: Guardian */}
          {step === 2 && (
            <>
              <h2 className="font-display font-semibold text-lg text-text-primary">Guardian Information</h2>
              <Field label="Guardian Name" name="guardianName" placeholder="Parent/Guardian full name" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Relation" name="guardianRelation">
                  <select {...register('guardianRelation')} className="input mt-1.5">
                    <option value="">Select</option>
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Guardian Phone" name="guardianPhone" placeholder="+1 234 567 890" />
              </div>
            </>
          )}

          {/* Step 3: Address */}
          {step === 3 && (
            <>
              <h2 className="font-display font-semibold text-lg text-text-primary">Address</h2>
              <Field label="Street Address" name="currentStreet" placeholder="123 Main St" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" name="currentCity" placeholder="City" />
                <Field label="State" name="currentState" placeholder="State" />
              </div>
            </>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-4 animate-fade-up">
          <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 0}
            className="btn-secondary disabled:opacity-0">
            Previous
          </button>
          {step < steps.length - 1 ? (
            <button type="button" onClick={nextStep} className="btn-primary">
              Continue <ChevronRight size={15} />
            </button>
          ) : (
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
              {isLoading ? 'Creating...' : 'Add Student'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
