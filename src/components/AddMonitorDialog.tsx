import { useState } from "react";
import { Plus } from "lucide-react";
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

interface AddMonitorDialogProps {
  onAdd: (monitor: { name: string; url: string; interval: number; enabled: boolean }) => void;
}

export function AddMonitorDialog({ onAdd }: AddMonitorDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState("60");

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

    onAdd({
      name: name.trim(),
      url: url.trim(),
      interval: parseInt(interval),
      enabled: true,
    });

    toast({
      title: "成功",
      description: `已添加监控任务：${name}`,
    });

    setName("");
    setUrl("");
    setInterval("60");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          添加监控
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>添加监控任务</DialogTitle>
            <DialogDescription>
              输入要监控的网站信息，系统将定期检测其可用性。
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
                  <SelectItem value="30">每 30 秒</SelectItem>
                  <SelectItem value="60">每 1 分钟</SelectItem>
                  <SelectItem value="300">每 5 分钟</SelectItem>
                  <SelectItem value="900">每 15 分钟</SelectItem>
                  <SelectItem value="3600">每 1 小时</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">添加</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
