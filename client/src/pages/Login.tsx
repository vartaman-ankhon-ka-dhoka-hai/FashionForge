import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { 
  requestOtpSchema, 
  verifyOtpSchema, 
  updateProfileSchema,
  type RequestOtp, 
  type VerifyOtp,
  type UpdateProfile 
} from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [phone, setPhone] = useState("");
  const [tempToken, setTempToken] = useState("");

  const phoneForm = useForm<RequestOtp>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<VerifyOtp>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phone: "", otpCode: "" },
  });

  const profileForm = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", email: "" },
  });

  const requestOtpMutation = useMutation({
    mutationFn: async (data: RequestOtp) => {
      const res = await apiRequest("POST", "/api/auth/request-otp", data);
      return res.json();
    },
    onSuccess: (data) => {
      setPhone(phoneForm.getValues("phone"));
      otpForm.setValue("phone", phoneForm.getValues("phone"));
      setStep("otp");
      toast({ 
        title: "OTP sent!", 
        description: `Check your console for the OTP sent to ${data.phone}` 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyOtp) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", data);
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      setTempToken(data.token);
      localStorage.setItem("token", data.token);
      
      // If user has name, they're fully registered
      if (data.user.name) {
        toast({ title: "Welcome back!", description: `Logged in as ${data.user.name}` });
        setLocation(data.user.isAdmin ? "/admin" : "/");
      } else {
        // New user, collect profile info
        setStep("profile");
        toast({ title: "OTP verified!", description: "Please complete your profile" });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Invalid OTP",
        description: error.message || "Please check the OTP and try again",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      const res = await apiRequest("PATCH", "/api/auth/profile", data);
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data);
      toast({ title: "Welcome to Made in Pune!", description: `Profile created for ${data.name}` });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleResendOtp = () => {
    phoneForm.setValue("phone", phone);
    requestOtpMutation.mutate({ phone });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Made in Pune</CardTitle>
          <CardDescription>
            {step === "phone" && "Enter your phone number to get started"}
            {step === "otp" && "Enter the OTP sent to your phone"}
            {step === "profile" && "Complete your profile to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Phone Number */}
          {step === "phone" && (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit((data) => requestOtpMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="+919876543210" 
                          {...field} 
                          data-testid="input-phone" 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Format: +91 followed by 10 digits
                      </p>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={requestOtpMutation.isPending} 
                  data-testid="button-request-otp"
                >
                  {requestOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            </Form>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit((data) => verifyOtpMutation.mutate(data))} className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  OTP sent to {phone}
                </div>
                <FormField
                  control={otpForm.control}
                  name="otpCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter OTP</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="123456" 
                          maxLength={6}
                          {...field} 
                          data-testid="input-otp" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={verifyOtpMutation.isPending} 
                    data-testid="button-verify-otp"
                  >
                    {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleResendOtp}
                    disabled={requestOtpMutation.isPending}
                    data-testid="button-resend-otp"
                  >
                    Resend
                  </Button>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setStep("phone")}
                  data-testid="button-change-phone"
                >
                  Change Phone Number
                </Button>
              </form>
            </Form>
          )}

          {/* Step 3: Profile Completion */}
          {step === "profile" && (
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          {...field} 
                          data-testid="input-profile-name" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="your@email.com" 
                          {...field} 
                          data-testid="input-profile-email" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={updateProfileMutation.isPending} 
                  data-testid="button-complete-profile"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Complete Profile"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
