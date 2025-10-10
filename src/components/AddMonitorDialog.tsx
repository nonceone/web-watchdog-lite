import { useState, useEffect } from "react";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Monitor } from "@/types/monitor";

interface AddMonitorDialogProps {
  monitor?: Monitor;
  onAdd?: (monitor: { name: string; url: string; interval: number; enabled: boolean; alertEmail?: string }) => void;
  onUpdate?: (id: string, monitor: { name: string; url: string; interval: number; enabled: boolean; alertEmail?: string }) => void;
  trigger?: React.ReactNode;
}

export function AddMonitorDialog({ monitor, onAdd, onUpdate, trigger }: AddMonitorDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState("60");
  const [alertEmail, setAlertEmail] = useState("");

  const isEditMode = !!monitor;

  useEffect(() => {
    if (monitor) {
      setName(monitor.name);
      setUrl(monitor.url);
      setInterval(monitor.interval.toString());
      setAlertEmail(monitor.alertEmail || "");
    }
  }, [monitor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) {
      toast({
        title: "错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(url);
    } catch {
      toast({
        title: "错误",
        description: "请输入有效的 URL",
        variant: "destructive",
      });
      return;
    }

    const intervalNum = parseInt(interval);
    if (intervalNum < 5) {
      toast({
        title: "错误",
        description: "检测间隔不能小于 5 秒",
        variant: "destructive",
      });
      return;
    }

    const monitorData = {
      name: name.trim(),
      url: url.trim(),
      interval: intervalNum,
      enabled: monitor?.enabled ?? true,
      alertEmail: alertEmail.trim() || undefined,
    };

    if (isEditMode && onUpdate && monitor) {
      onUpdate(monitor.id, monitorData);
      toast({
        title: "成功",
        description: `已更新监控任务：${name}`,
      });
    } else if (onAdd) {
      onAdd(monitorData);
      toast({
        title: "成功",
        description: `已添加监控任务：${name}`,
      });
    }

    if (!isEditMode) {
      setName("");
      setUrl("");
      setInterval("60");
      setAlertEmail("");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            添加监控
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "编辑监控任务" : "添加监控任务"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "修改监控任务配置" : "输入要监控的网站信息，系统将定期检测其可用性。"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                placeholder="我的网站"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interval">检测频率</Label>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger id="interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">每 5 秒</SelectItem>
                  <SelectItem value="10">每 10 秒</SelectItem>
                  <SelectItem value="30">每 30 秒</SelectItem>
                  <SelectItem value="60">每 1 分钟</SelectItem>
                  <SelectItem value="300">每 5 分钟</SelectItem>
                  <SelectItem value="900">每 15 分钟</SelectItem>
                  <SelectItem value="3600">每 1 小时</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">最小间隔：5秒</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="alertEmail">告警邮箱（可选）</Label>
              <Input
                id="alertEmail"
                type="email"
                placeholder="alert@example.com"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">网站不可用时发送通知（需要后端支持）</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEditMode ? "保存" : "添加"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
